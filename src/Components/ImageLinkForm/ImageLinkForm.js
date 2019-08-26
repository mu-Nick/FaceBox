import React from 'react';
import './ImageLinkForm.css';

const ImageLinkForm = ({onInputChange, onButtonSubmit}) => {
	return (
		<div >
			<p className='f3'>
				{'This is FaceBox, Paste image url below to box faces'}
			</p>
			<div className='w-90 center pa4 br3 shadow-5 pattern'>
				<input className='f4 pa2 center' type='text' onChange={onInputChange}/>
				<button className='grow f4 link ph3 pv2 dib white bg-light-purple' 
				onClick={onButtonSubmit}>Detect</button>
			</div>
		</div>
	)
}

export default ImageLinkForm;