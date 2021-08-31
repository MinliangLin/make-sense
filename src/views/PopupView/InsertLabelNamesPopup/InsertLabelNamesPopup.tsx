import React, { useState } from 'react'
import './InsertLabelNamesPopup.scss'
import { GenericYesNoPopup } from '../GenericYesNoPopup/GenericYesNoPopup';
import { PopupWindowType } from '../../../data/enums/PopupWindowType';
import { updateLabelNames } from '../../../store/labels/actionCreators';
import { updateActivePopupType } from '../../../store/general/actionCreators';
import { AppState } from '../../../store';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { ImageButton } from '../../Common/ImageButton/ImageButton';
import { LabelName } from '../../../store/labels/types';
import { LabelUtil } from '../../../utils/LabelUtil';
import { LabelsSelector } from '../../../store/selectors/LabelsSelector';
import { LabelActions } from '../../../logic/actions/LabelActions';
import {ColorSelectorView} from './ColorSelectorView/ColorSelectorView';
import TextField from '@material-ui/core/TextField';
import {Settings} from '../../../settings/Settings';
import {withStyles} from '@material-ui/core';
import { reject } from 'lodash';

const StyledTextField = withStyles({
    root: {
        '& .MuiInputBase-root': {
            color: 'white',
        },
        '& label': {
            color: 'white',
        },
        '& .MuiInput-underline:before': {
            borderBottomColor: 'white',
        },
        '& .MuiInput-underline:hover:before': {
            borderBottomColor: 'white',
        },
        '& label.Mui-focused': {
            color: Settings.SECONDARY_COLOR,
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: Settings.SECONDARY_COLOR,
        }
    },
})(TextField);

interface IProps {
    updateActivePopupTypeAction: (activePopupType: PopupWindowType) => any;
    updateLabelNamesAction: (labels: LabelName[]) => any;
    isUpdate: boolean;
}

const InsertLabelNamesPopup: React.FC<IProps> = (
    {
        updateActivePopupTypeAction,
        updateLabelNamesAction,
        isUpdate
    }) => {
    const [labelNames, setLabelNames] = useState(LabelsSelector.getLabelNames());

    const addHandle = () => {
        const newLabelNames = [
            ...labelNames,
            LabelUtil.createLabelName('')
        ]
        setLabelNames(newLabelNames);
    };

    const deleteHandle = (id: string) => {
        const newLabelNames = reject(labelNames, {id})
        setLabelNames(newLabelNames);
    };

    const handleKeyUp = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            addHandle();
        }
    }

    const labelInputs = labelNames.map((labelName: LabelName) => {
        const onChangeCallback = (event: React.ChangeEvent<HTMLInputElement>) =>
            onChange(labelName.id, event.target.value)
        const onDeleteCallback = () => deleteHandle(labelName.id)
        return <div className='LabelEntry' key={labelName.id}>
            <StyledTextField
                id={'key'}
                autoComplete={'off'}
                type={'text'}
                margin={'dense'}
                label={'Insert label'}
                onKeyUp={handleKeyUp}
                value={labelName.name}
                onChange={onChangeCallback}
                style = {{width: 300}}
                InputLabelProps={{
                    shrink: true,
                }}
            />
            <ColorSelectorView/>
            <ImageButton
                image={'ico/trash.png'}
                imageAlt={'remove_label'}
                buttonSize={{ width: 30, height: 30 }}
                onClick={onDeleteCallback}
            />
        </div>
    });

    const onChange = (id: string, value: string) => {
        const newLabelNames = labelNames.map((labelName: LabelName) => {
            return labelName.id === id ? {...labelName, name: value} : labelName
        })
        setLabelNames(newLabelNames);
    };

    const onCreateAccept = () => {
        if (labelNames.length > 0) {
            updateLabelNamesAction(labelNames);
        }
        updateActivePopupTypeAction(null);
    };

    const onUpdateAccept = () => {
        const missingIds: string[] = LabelUtil.labelNamesIdsDiff(LabelsSelector.getLabelNames(), labelNames);
        LabelActions.removeLabelNames(missingIds);
        updateActivePopupTypeAction(null);
    };

    const onCreateReject = () => {
        updateActivePopupTypeAction(PopupWindowType.LOAD_LABEL_NAMES);
    };

    const onUpdateReject = () => {
        updateActivePopupTypeAction(null);
    };

    const renderContent = () => {
        return (<div className='InsertLabelNamesPopup'>
            <div className='LeftContainer'>
                <ImageButton
                    image={'ico/plus.png'}
                    imageAlt={'plus'}
                    buttonSize={{ width: 40, height: 40 }}
                    padding={25}
                    onClick={addHandle}
                />
            </div>
            <div className='RightContainer'>
                <div className='Message'>
                    {
                        isUpdate ?
                            'You can now edit the label names you use to describe the objects in the photos. Use the ' +
                            '+ button to add a new empty text field.' :
                            'Before you start, you can create a list of labels you plan to assign to objects in your ' +
                            'project. You can also choose to skip that part for now and define label names as you go.'
                    }
                </div>
                <div className='LabelsContainer'>
                    {Object.keys(labelNames).length !== 0 ? <Scrollbars>
                        <div
                            className='InsertLabelNamesPopupContent'
                        >
                            {labelInputs}
                        </div>
                    </Scrollbars> :
                        <div
                            className='EmptyList'
                            onClick={addHandle}
                        >
                            <img
                                draggable={false}
                                alt={'upload'}
                                src={'ico/type-writer.png'}
                            />
                            <p className='extraBold'>Your label list is empty</p>
                        </div>}
                </div>
            </div>
        </div>);
    };

    return (
        <GenericYesNoPopup
            title={isUpdate ? 'Edit labels' : 'Create labels'}
            renderContent={renderContent}
            acceptLabel={isUpdate ? 'Accept' : 'Start project'}
            onAccept={isUpdate ? onUpdateAccept : onCreateAccept}
            rejectLabel={isUpdate ? 'Cancel' : 'Load labels from file'}
            onReject={isUpdate ? onUpdateReject : onCreateReject}
        />)
};

const mapDispatchToProps = {
    updateActivePopupTypeAction: updateActivePopupType,
    updateLabelNamesAction: updateLabelNames
};

const mapStateToProps = (state: AppState) => ({});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(InsertLabelNamesPopup);
